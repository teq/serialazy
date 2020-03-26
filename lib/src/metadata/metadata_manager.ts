import MetadataContainer from "./metadata_container";

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

    /** Set own metadata */
    public setOwnMetaFor(proto: Object, metadata: MetadataContainer): void {
        const key = MetadataManager.key(this.backend, this.projection);
        Reflect.defineMetadata(key, metadata, proto);
    }

    /** Get own metadata */
    public getOwnMetaFor(proto: Object): MetadataContainer {

        if (proto === null || proto === undefined) {
            throw new Error('Expecting prototype object to be not null/undefined');
        }

        const key = MetadataManager.key(this.backend, this.projection);
        const metadata: MetadataContainer = Reflect.getOwnMetadata(key, proto);

        if (metadata) {
            const version = metadata.version || 0;
            if (version !== MetadataContainer.VERSION) {
                throw new Error(
                    `Metadata version mismatch (lib: ${MetadataContainer.VERSION}, meta: ${version}). ` +
                    'Seems like you\'re trying to use 2 or more incompatible versions of "serialazy"'
                );
            }
        }

        return metadata;

    }

    /** Get own or inherited metadata */
    public getMetaFor(proto: Object): MetadataContainer {

        let metadata = this.getOwnMetaFor(proto);

        if (!metadata) {
            const inheritedMetadata = this.seekInheritedMetaFor(proto);
            if (inheritedMetadata?.aggregatePropertySerializers(true)) {
                // No own metadata, but it inherits from a property-bag serializable.
                // Return a virtual (not persisted) metadata.
                metadata = new MetadataContainer(this.backend, this.projection, proto);
            }
        }

        return metadata;

    }

    /** Seek prototype chain for inherited metadata */
    public seekInheritedMetaFor(proto: Object): MetadataContainer {

        let metadata: MetadataContainer;

        while (proto && !metadata) {
            proto = Object.getPrototypeOf(proto);
            metadata = proto && this.getOwnMetaFor(proto);
        }

        return metadata;

    }

    /** Get or create a metadata container */
    public getOrCreateMetaFor(proto: Object): MetadataContainer {

        let ownMeta = this.getOwnMetaFor(proto);

        if (!ownMeta) {
            ownMeta = new MetadataContainer(this.backend, this.projection, proto);
            this.setOwnMetaFor(proto, ownMeta);
        }

        return ownMeta;

    }

}
