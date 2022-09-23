---
title: Changelog
---

# Changelog

v3.0.0
------

* **[BREAKING]** Removed `@Serialize.Type()` and `@Serialize.Custom()` decorators.
  Now all type and property decoration is done by `@Serialize()`.
* **[BREAKING]** `@Serialize()` accepts custom type serializer (`up` & `down`) and options as a single argument.
* **[BREAKING]** Removed `TypeSerializer.discriminate()` (redundant, was never used)
* Add `Serializable`, an abstract base class for serializables
* Async serialization / deserialization (`deflate.resolve` and `inflate.resolve`)
* Serializatio / deserialization to/from a POJO (`as` and `toPojo` options)
* Add projections (`projection` and `fallbackToDefaultProjection` options)
* Add optional `as` parameter to DeflateOptions. It allows to override a type of serializable
  (serialize as a different type)
* Add options for `inflate` / `deflate`, pass them to `up` / `down` functions as second argument
* Both `up` and `down` functions for custom type serializer are now optional

v2.0.2
------

* Refine class inheritance logic: Inheriting from property-bag serializable makes child class
  a property-bag serializable. Inheriting from serializable with custom type serializer doesn't
  make child class serializable. Fixes [#11](https://github.com/teq/serialazy/issues/11).

v2.0.1
------

* Update `PropertyBagMetadata.getTypeSerializer()`: `up` & `down` arguments are checked for being null/undefined
  before applying property serializers. Fixes [#6](https://github.com/teq/serialazy/issues/6).

v2.0.0
------

* **[BREAKING]** Removed `isSerializable`, `deepMerge` functions and `@Serialize.Skip()` decorator.
* Add `@Serialize.Type()` decorator which allows to define custom serializers for types
* `deflate` / `inflate` can accept primitives (string, number, boolean and their "boxed" variants, null, undefined)

v1.3.1
------

* Add `assertSerializable` functions which throws an error if target is not serializable class instance
  or serializable class constructor function.
* Previously to be _serializable_ class should have serializers on its own properties (i.e. should have own metadata)
  with no respect to its ancestors. Now class is _serializable_ if it either has own serializers or any of its ancestors have serializers.
* Using global symbol to access serializable's metadata.
  This fixes a bug when project dependencies introduce multiple instances of library
  and metadata defined in one version can't be accessed in another.

v1.3.0
------

* Add `deepMerge` function which performs a deep (recursive) property merge from serializable-like source object to serializable destination object
* Add `isSerializable` function which allows to check if target is a serializable class instance or serializable class constructor function
* Add class name to serialization / deserialization error message

v1.2.3
------

* `Serialize.Custom` decorator now accepts either serializer or serializer provider function

v1.2.2
------

* Fix a bug with circular module dependencies

v1.2.1
------

* Export JSON types

v1.2.0
------

* Child class inherits serializers from parent
* Add support for `options` in custom serializers
* Add `name` option which allows to map property to a different name

v1.0.1
------

Initial version features:
* Default serializers for primitive types (string, number, boolean)
* Support for optional / nullable properties
* Recursive object tree serialization (circular references not handled yet)
* Custom property serialization functions
