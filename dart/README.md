# Dart Microgen V3 SDK

### Try Run

```shell
dart run example/microgen_v3_dart_sdk_example.dart
```

# Service

### select()

Find all records from the service.

```dart
final { data, status, error} = await microgen.from("Todos").select()
```

### getById()

Get a record by id.

```dart
final { data, status, error} = await microgen.from("Todos").getById("63d3bbc2e7f13b31a67f3f69")
```

### count()

Count total records in the service.

```dart
final { data, status, error} = await microgen.from('Todos').count()
```

### insert()

Create a record.

```dart
final { data, status, error} = await microgen.from('Todos').insert({"name": "Task 2", "status": "Done"})
```

### deleteById()

Delete a record by id.

```dart
final { data, status, error} = await microgen.from('Todos').deleteById("65d434476032769d31e8ff5d123")
```
