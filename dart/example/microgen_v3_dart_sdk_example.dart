import 'package:microgen_v3_dart_sdk/microgen_v3_dart_sdk.dart';

final microgen = Microgen(apiKey: "7de3e86f-9abc-493b-b400-4fff252844de");

void main() async {
  // final todos = await microgen.from('Todos').select();
  // final todoCount = await microgen.from('Todos').count();
  // final todoDetail =
  //     await microgen.from('Todos').getById("63d3bbc2e7f13b31a67f3f69");
  // final todoInsert =
  //     await microgen.from('Todos').insert({"name": "Task 2", "status": "Done"});
  // final todoDelete =
  //     await microgen.from('Todos').deleteById("65d434476032769d31e8ff5d123");
  final todoUpdate = await microgen.from('Todos').updateById(
      "65d434326032769d31e8ff59", {"name": "Task 2", "status": "Done"});

  print('====================================');
  // print('todos: ${todos}');
  // print('------------------------------------');
  // print('songs count: ${todoCount}');
  // print('------------------------------------');
  // print('songs detail: ${todoDetail}');
  // print('------------------------------------');
  // print('todo insert: ${todoInsert}');
  // print('------------------------------------');
  // print('todo delete: ${todoDelete}');
  // print('------------------------------------');
  print('todo update: ${todoUpdate}');
  print('====================================');
}
