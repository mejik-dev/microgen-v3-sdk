import 'dart:convert';
import 'package:http/http.dart';

dynamic handleResponse(StreamedResponse response) async {
  final status = response.statusCode;

  if (status == 200 || status == 201) {
    final data = await response.stream.bytesToString();
    return {'status': status, 'data': jsonDecode(data)};
  } else {
    return {
      'status': status,
      'error': {'message': response.reasonPhrase}
    };
  }
}
