import { DEFAULT_PROJECTION } from ".";
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
        private readonly backend: string,
        private readonly projection: string
    ) {}

    private static key(backend: string, projection: string) {
        // There may be multiple "serialazy" instances in project from different dependencies.
        // We use global symbol to make sure that all of them can access the same metadata.
        return Symbol.for(`com.github.teq.serialazy.metadata.${backend}.${projection}`);
    }

    /** Cache for manager instances */
    private static instances = new Map<Symbol, MetadataManager>();

    /**
     * Get metadata manager instance
     * @param backend Serialization backend
     * @param projection Serialization projection
     */
    public static get(backend: string, projection: string) {

        const key = MetadataManager.key(backend, projection);

        let instance = this.instances.get(key);

        if (!instance) {
            instance = new this(backend, projection);
            this.instances.set(key, instance);
        }

        return instance;

    }

    /** Get own metadata */
    public getOwnMetaFor(proto: Object): Metadata {

        if (proto === null || proto === undefined) {
            throw new Error('Expecting prototype object to be not null/undefined');
        }

        const key = MetadataManager.key(this.backend, this.projection);
        const metadata: Metadata = Reflect.getOwnMetadata(key, proto) || null;

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

    /** Get metadata */
    public getMetaFor(proto: Object): Metadata {

        let result: Metadata = null;

        const ownMeta = this.getOwnMetaFor(proto);

        if (ownMeta) {
            result = ownMeta;
        } else {
            const inheritedMeta = this.seekInheritedMetaFor(proto);
            if (inheritedMeta?.kind === PropertyBagMetadata.kind) {
                // No own metadata, but it inherits from property-bag serializable.
                // Return a virtual (not persisted) property-bag metadata.
                result = new PropertyBagMetadata(this.backend, this.projection, proto, METADATA_VERSION);
            }
        }

        return result;
    }

    /** Set own metadata */
    public setMetaFor(proto: Object, metadata: Metadata): void {
        const key = MetadataManager.key(this.backend, this.projection);
        Reflect.defineMetadata(key, metadata, proto);
    }

    /** Seek prototype chain for inherited metadata */
    public seekInheritedMetaFor(proto: Object): Metadata {

        let result: Metadata = null;

        while (proto && !result) {
            proto = Object.getPrototypeOf(proto);
            result = proto ? this.getOwnMetaFor(proto) : null;
        }

        return result;

    }

    /** Get or create own custom serializable type metadata */
    public getOrCreateCustomTypeMetaFor(proto: Object): CustomTypeMetadata {

        let ownMeta = this.getOwnMetaFor(proto);

        if (!ownMeta) {
            const inheritedMeta = this.seekInheritedMetaFor(proto);
            if (inheritedMeta) {
                throw new Error('Can\'t define a custom serializer on type which inherits from another serializable');
            }
            ownMeta = new CustomTypeMetadata(this.backend, this.projection, proto, METADATA_VERSION);
            this.setMetaFor(proto, ownMeta);
        } else if (ownMeta.kind === PropertyBagMetadata.kind) {
            throw new Error('Can\'t define a custom type serializer on a "property bag" serializable');
        }

        return ownMeta;

    }

    /** Get or create own property-bag serializable type metadata */
    public getOrCreatePropertyBagMetaFor(proto: Object): PropertyBagMetadata {

        let ownMeta = this.getOwnMetaFor(proto);

        if (!ownMeta) {
            const inheritedMeta = this.seekInheritedMetaFor(proto);
            if (inheritedMeta?.kind === CustomTypeMetadata.kind) {
                throw new Error('A property-bag serializable can\'t inherit from a type with custom serializer');
            }
            ownMeta = new PropertyBagMetadata(this.backend, this.projection, proto, METADATA_VERSION);
            this.setMetaFor(proto, ownMeta);
        } else if (ownMeta.kind === CustomTypeMetadata.kind) {
            throw new Error('Can\'t define property serializers on type which has a custom serializer');
        }

        return ownMeta;

    }

}
