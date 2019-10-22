import PropertyBagMetadata from './property_bag_metadata';
import SerializableTypeMetadata from './serializable_type_metadata';

/**
 * There may be multiple "serialazy" instances in project (from different dependencies)
 * We use global symbol to make sure that all of them can access the same metadata.
 */
export const METADATA_KEY = Symbol.for('com.github.teq.serialazy.metadata');

/**
 * We need to make sure that metadata is compatible with all "serialazy" instances.
 * This version is increased in case of incompatible changes in `Metadata` class.
 */
export const METADATA_VERSION = 2;

/** Get own metadata for given prototype if it's exists or return a null */
export function getOwnMetaFor<TMetadata extends SerializableTypeMetadata>(proto: Object): TMetadata {

    if (proto === null || proto === undefined) {
        throw new Error('Expecting prototype object to be not null/undefined');
    }

    const metadata: TMetadata = Reflect.getOwnMetadata(METADATA_KEY, proto) || null;

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

export function setMetaFor(proto: Object, metadata: SerializableTypeMetadata): void {
    Reflect.defineMetadata(METADATA_KEY, metadata, proto);
}

/** Seek prototype chain for next inherited serializable's metadata */
export function seekForInheritedMetaFor<TMetadata extends SerializableTypeMetadata>(proto: Object): TMetadata {

    let result: TMetadata = null;

    while (proto && !result) {
        proto = Object.getPrototypeOf(proto);
        result = proto ? getOwnMetaFor(proto) : null;
    }

    return result;

}

/** Get own metadata or seek prototype chain for nearest ancestor which has metadata. */
export function getMetaFor(proto: Object): SerializableTypeMetadata {

    let result: SerializableTypeMetadata = null;

    const ownMeta = getOwnMetaFor(proto);

    if (ownMeta) {
        result = ownMeta;
    } else {
        const inheritedMeta = seekForInheritedMetaFor(proto);
        if (inheritedMeta && inheritedMeta.type === SerializableTypeMetadata.Type.PROP_BAG) {
            // No own metadata, but it inherits from property-bag serializable
            // => it should be property-bag serializable
            result = PropertyBagMetadata.getOrCreateFor(proto);
        }
    }

    return result;


}
