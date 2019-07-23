import CustomTypeMetadata from "./custom_type_metadata";
import PropertyBagMetadata from "./property_bag_metadata";

type Metadata = CustomTypeMetadata | PropertyBagMetadata;

/**
 * Metadata version number.
 *
 * It is possible to mix multiple serialazy versions which came from different dependencies.
 * To make sure that we access a compatible version of metadata (or throw an error instead)
 * we use a metadata version number.
 *
 * It's not directly linked with package (NPM) version, but:
 * * Several consecutive major package versions can share the same metadata version.
 *   (If there are chages in public API, but not in metadata format)
 * * Metadata version increase is a **breaking change**, so the major part
 *   of package versions should be increased as well
 */
const METADATA_VERSION = 3;

/** Used to access serializable type metadata */
export default class MetadataManager {

    /** NOTE: Constructable via `get` factory method */
    private constructor(
        private readonly key: Symbol
    ) {}

    /** Cache for manager instances */
    private static instances = new Map<Symbol, MetadataManager>();

    /**
     * Get metadata manager instance
     * @param backend Serialization backend
     * @param projection Serialization projection
     */
    public static get(backend: string, projection: string) {

        // There may be multiple "serialazy" instances in project from different dependencies.
        // We use global symbol to make sure that all of them can access the same metadata.
        const key = Symbol.for(`com.github.teq.serialazy.metadata.${backend}.${projection}`);

        let instance = this.instances.get(key);

        if (!instance) {
            instance = new this(key);
            this.instances.set(key, instance);
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
