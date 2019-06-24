import CustomTypeMetadata from "./custom_type_metadata";
import PropertyBagMetadata from "./property_bag_metadata";

type Metadata = CustomTypeMetadata | PropertyBagMetadata;

/**
 * NOTE:
 * It is possible that in given project we'll have a multiple of (possibly incompatible)
 * versions of serialazy which came from different dependencies. To make sure that we access
 * a compatible version of metadata (or throw an error instead) we use a version number
 * which is increased in case of incompatible changes in metadata public props/methods.
 * TODO: Use a major part of npm package version number.
 */
const METADATA_VERSION = 3;

/** Get metadata unique symbol for given `backend` and `projection` */
function key(backend: string, projection: string) {

    // There may be multiple "serialazy" instances in project (from different dependencies)
    // We use global symbol to make sure that all of them can access the same metadata.

    return Symbol.for(`com.github.teq.serialazy.metadata.${backend}.${projection}`);

}

/** Used to access serializable type metadata */
export default class MetadataManager {

    private readonly key: Symbol;

    /** NOTE: Constructable via `get` factory method */
    private constructor(backend: string, projection: string) {
        this.key = key(backend, projection);
    }

    /** Cache for manager instances */
    private static instances = new Map<Symbol, MetadataManager>();

    /**
     * Get metadata manager instance
     * @param backend Serialization backend.
     * @param projection Serialization projection. _(Default: 'default')_
     */
    public static get(backend: string, projection = 'default') {
        let instance = this.instances.get(key(backend, projection));
        if (!instance) {
            instance = new this(backend, projection);
            this.instances.set(key(backend, projection), instance);
        }
        return instance;
    }

    /** Get own metadata for given prototype if it's exists or return a null */
    public getOwnMetaFor(proto: Object): Metadata {

        if (proto === null || proto === undefined) {
            throw new Error('Expecting prototype object to be not null/undefined');
        }

        const metadata: Metadata = Reflect.getOwnMetadata(this.key, proto) || null;

        if (metadata) {
            const version = metadata.version || 0;
            if (version !== METADATA_VERSION) {
                throw new Error(
                    `Metadata version mismatch (lib: ${METADATA_VERSION}, meta: ${version}). ` +
                    'Seems like you\'re trying to use 2 or more incompatible versions of "serialazy"'
                );
            }
        }

        return metadata;

    }

    /** Get own metadata or seek prototype chain for nearest ancestor which has metadata. */
    public getOwnOrInheritedMetaFor(proto: Object): Metadata {
        return this.getOwnMetaFor(proto) || this.seekInheritedMetaFor(proto);
    }

    /** Get own metadata for given prototype */
    public setOwnMetaFor(proto: Object, metadata: Metadata): void {
        Reflect.defineMetadata(this.key, metadata, proto);
    }

    /** Seek prototype chain for inherited serializable's metadata */
    public seekInheritedMetaFor(proto: Object): Metadata {

        let result: Metadata = null;

        while (proto && !result) {
            proto = Object.getPrototypeOf(proto);
            result = proto ? this.getOwnMetaFor(proto) : null;
        }

        return result;

    }

    /** Get or create own custom type metadata for given prototype */
    public getOrCreateCustomTypeMetaFor(proto: Object): CustomTypeMetadata {

        let ownMeta = this.getOwnMetaFor(proto);

        if (!ownMeta) {
            const inheritedMeta = this.seekInheritedMetaFor(proto);
            if (inheritedMeta) {
                throw new Error('Can\'t define a custom serializer on type which inherits from another serializable');
            }
            ownMeta = new CustomTypeMetadata(proto, METADATA_VERSION, this);
            this.setOwnMetaFor(proto, ownMeta);
        } else if (ownMeta.kind === PropertyBagMetadata.kind) {
            throw new Error('Can\'t define a custom type serializer on a "property bag" serializable');
        }

        return ownMeta;

    }

    /** Get own metadata for given prototype if it's exists or create an empty metadata container */
    public getOrCreatePropertyBagMetaFor(proto: Object): PropertyBagMetadata {

        let ownMeta = this.getOwnMetaFor(proto);

        if (!ownMeta) {
            const inheritedMeta = this.seekInheritedMetaFor(proto);
            if (inheritedMeta && inheritedMeta.kind !== PropertyBagMetadata.kind) {
                throw new Error('A property-bag serializable can\'t inherit from a type with custom serializer');
            }
            ownMeta = new PropertyBagMetadata(proto, METADATA_VERSION, this);
            this.setOwnMetaFor(proto, ownMeta);
        } else if (ownMeta.kind === CustomTypeMetadata.kind) {
            throw new Error('Can\'t define property serializers on type which has a custom serializer');
        }

        return ownMeta;

    }

}
