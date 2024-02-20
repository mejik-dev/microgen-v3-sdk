import 'package:microgen_v3_dart_sdk/microgen_v3_dart_sdk.dart';

final microgen = Microgen(apiKey: "3534482b-4bbd-4589-9a4c-01b645b26833");

void main() async {
  // final songs = await microgen.from('Songs').select();
  // final songCount = await microgen.from('Songs').count();
  // final songDetail =
  //     await microgen.from('Songs').getById("63d3bbc2e7f13b31a67f3f69");
  // final songInsert = await microgen.from('Songs').insert({'title': "hello3"});
  final songDelete =
      await microgen.from('Songs').deleteById("65addd88b78874abe1af9c8e");

  print('====================================');
  // print('songs: ${songs}');
  // print('------------------------------------');
  // print('songs count: ${songCount}');
  // print('------------------------------------');
  // print('songs detail: ${songDetail}');
  // print('------------------------------------');
  // print('songs insert: ${songInsert}');
  print('------------------------------------');
  print('songs delete: ${songDelete}');
  print('====================================');
}
