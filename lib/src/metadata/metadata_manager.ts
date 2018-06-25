import CustomTypeMetadata from "./custom_type_metadata";
import PropertyBagMetadata from "./property_bag_metadata";
import SerializableTypeMetadata from "./serializable_type_metadata";

/**
 * We need to make sure that metadata is compatible with all "serialazy" instances.
 * This version is increased in case of incompatible changes in `Metadata` class.
 */
const METADATA_VERSION = 3;

/** Generates metadata unique symbol for given `backend` and `projection` */
function key(backend: string, projection: string) {

    // There may be multiple "serialazy" instances in project (from different dependencies)
    // We use global symbol to make sure that all of them can access the same metadata.

    return Symbol.for(`com.github.teq.serialazy.metadata.${backend}.${projection}`);

}

/** Used to access serializable type metadata */
export default class MetadataManager {

    private readonly key: Symbol;

    private constructor(
        private readonly backend: string,
        private readonly projection: string
    ) {
        this.key = key(backend, projection);
    }

    private static instances = new Map<Symbol, MetadataManager>();

    /**
     * Get metadata manager instance
     * @param backend Serialization backend. _(Default: 'json')_
     * @param projection Serialization projection. _(Default: 'default')_
     */
    public static get(backend = 'json', projection = 'default') {
        let instance = this.instances.get(key(backend, projection));
        if (!instance) {
            instance = new this(backend, projection);
        }
        return instance;
    }

    /** Get own metadata for given prototype if it's exists or return a null */
    public getOwnMetaFor<TMetadata extends SerializableTypeMetadata>(proto: Object): TMetadata {

        if (proto === null || proto === undefined) {
            throw new Error('Expecting prototype object to be not null/undefined');
        }

        const metadata: TMetadata = Reflect.getOwnMetadata(this.key, proto) || null;

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
    public getOwnOrInheritedMetaFor<TMetadata extends SerializableTypeMetadata>(proto: Object): TMetadata {
        return this.getOwnMetaFor<TMetadata>(proto) || this.seekInheritedMetaFor<TMetadata>(proto);
    }

    /** Get own metadata for given prototype */
    public setOwnMetaFor(proto: Object, metadata: SerializableTypeMetadata): void {
        Reflect.defineMetadata(this.key, metadata, proto);
    }

    /** Seek prototype chain for next inherited serializable's metadata */
    public seekInheritedMetaFor<TMetadata extends SerializableTypeMetadata>(proto: Object): TMetadata {

        let result: TMetadata = null;

        while (proto && !result) {
            proto = Object.getPrototypeOf(proto);
            result = proto ? this.getOwnMetaFor<TMetadata>(proto) : null;
        }

        return result;

    }

    /** Get or create own custom type metadata for given prototype */
    public getOrCreateCustomTypeMetaFor(proto: Object): CustomTypeMetadata {

        let metadata = this.getOwnMetaFor<CustomTypeMetadata>(proto);

        if (!metadata) {
            const inherited = this.seekInheritedMetaFor(proto);
            if (inherited) {
                throw new Error('Can\'t define a custom serializer on type which inherits from another serializable');
            }
            metadata = new CustomTypeMetadata(proto, METADATA_VERSION, this);
            this.setOwnMetaFor(proto, metadata);
        } else if (!(metadata instanceof CustomTypeMetadata)) {
            throw new Error('Can\'t define a custom serializer on type which has property serializers');
        }

        return metadata;

    }

    /** Get own metadata for given prototype if it's exists or create an empty metadata container */
    public getOrCreatePropertyBagMetaFor(proto: Object): PropertyBagMetadata {

        let metadata = this.getOwnMetaFor<PropertyBagMetadata>(proto);

        if (!metadata) {
            const inherited = this.seekInheritedMetaFor(proto);
            if (inherited && !(inherited instanceof PropertyBagMetadata)) {
                throw new Error('A property-bag serializable can\'t inherit from a type with custom serializer');
            }
            metadata = new PropertyBagMetadata(proto, METADATA_VERSION, this);
            this.setOwnMetaFor(proto, metadata);
        } else if (!(metadata instanceof PropertyBagMetadata)) {
            throw new Error('Can\'t define property serializers on type which has a custom serializer');
        }

        return metadata;

    }

}
