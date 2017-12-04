* Added `isSerializable` function which allows to check if target is a serializable class instance or serializable class constructor function
* Added class name to serialization/deserialization error message

v1.2.3
------

* `Serialize.Custom` decorator now accepts either serializer or serializer provider function

v1.2.2
------

* Fixed a bug with circular module dependencies

v1.2.1
------

* Added JSON types export

v1.2.0
------

* Child class inherits serializers from parent
* Added support for `options` in custom serializers
* Added `name` option which allows to map property to a different name

v1.0.1
------

Initial version features:
* Default serializers for primitive types (string, number, boolean)
* Support for optional / nullable properties
* Recursive object tree serialization (circular references not handled yet)
* Custom property serialization functions
