* [BREAKING] Removed `deepMerge` function.
* [BREAKING] Updated `isSerializable`. Additionaly to previous behaviour now it returns true for primitives
  (boolean/Boolean, number/Number, string/String), both instances and constructor functions. Returns true for null value.
* [BREAKING] Removed `@Serialize.Skip()` decorator which was used to "erase" property serializers inherited from parent class.
  This practice breaks inheritance. E.g.: We have `B extends A`, B "shadows" some property serializers from A. If we'll try to
  serialize an instance of B and then deserialize it as an instance of A, we'll have an error because of undefined props.

v1.3.1
------

* Added `assertSerializable` functions which throws an error if target is not serializable class instance
  or serializable class constructor function (TODO: add example to README).
* Previously to be _serializable_ class should have serializers on its own properties (i.e. should have own metadata)
  with no respect to its ancestors. Now class is _serializable_ if it either has own serializers or any of its ancestors have serializers.
* Using global symbol to access serializable's metadata.
  This fixes a bug when project dependencies introduce multiple instances of library
  and metadata defined in one verion can't be accessed in another.

v1.3.0
------

* Added `deepMerge` function which performs a deep (recursive) property merge from serializable-like source object to serializable destination object (TODO: add example to README)
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
