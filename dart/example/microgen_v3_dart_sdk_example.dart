import 'package:microgen_v3_dart_sdk/microgen_v3_dart_sdk.dart';

final microgen = Microgen(apiKey: "3534482b-4bbd-4589-9a4c-01b645b26833");

void main() async {
  final songs = await microgen.from('Songs').select();
  final songCount = await microgen.from('Songs').count();
  final songDetail =
      await microgen.from('Songs').byId("63d3bbc2e7f13b31a67f3f69");

  print('songs: ${songs}');
  print('songs count: ${songCount}');
  print('songs detail: ${songDetail}');
}
