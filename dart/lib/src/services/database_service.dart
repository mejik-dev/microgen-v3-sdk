import 'dart:convert';

import 'package:microgen_v3_dart_sdk/src/helpers/error_message.dart';
import 'package:microgen_v3_dart_sdk/src/helpers/response_handling.dart';
import 'package:microgen_v3_dart_sdk/src/microgen_v3_dart_sdk_base.dart';
import 'package:http/http.dart' as http;

class DatabaseService {
  final Microgen _microgen;
  final String _table;
  late final String _baseUrl;

  DatabaseService(this._microgen, this._table) {
    _baseUrl = '${_microgen.baseUrl}/$_table';
  }

  Future<dynamic> select() async {
    final url = Uri.parse(_baseUrl);

    final request = http.Request('GET', url);

    if (_microgen.token != null) {
      request.headers['Authorization'] = 'Bearer ${_microgen.token}';
    }

    final response = await http.Client().send(request);

    return handleResponse(response);
  }

  Future<dynamic> getById(String id) async {
    if (id == "") {
      return errorMsg("id is required");
    }

    final url = Uri.parse('$_baseUrl/$id');

    final request = http.Request('GET', url);

    if (_microgen.token != null) {
      request.headers['Authorization'] = 'Bearer ${_microgen.token}';
    }

    final response = await http.Client().send(request);

    return handleResponse(response);
  }

  Future<dynamic> count() async {
    final url = Uri.parse('$_baseUrl/count');

    final request = http.Request('GET', url);

    if (_microgen.token != null) {
      request.headers['Authorization'] = 'Bearer ${_microgen.token}';
    }

    final response = await http.Client().send(request);

    return handleResponse(response);
  }

  Future<dynamic> insert(Map<String, dynamic> data) async {
    final url = Uri.parse(_baseUrl);

    final request = http.Request('POST', url)
      ..headers['Content-Type'] = 'application/json';

    if (_microgen.token != null) {
      request.headers['Authorization'] = 'Bearer ${_microgen.token}';
    }

    request.body = jsonEncode(data);

    final response = await http.Client().send(request);

    return handleResponse(response);
  }

  Future<dynamic> deleteById(String id) async {
    if (id == "") {
      return errorMsg("id is required");
    }

    final url = Uri.parse('$_baseUrl/$id');

    final request = http.Request('DELETE', url);

    if (_microgen.token != null) {
      request.headers['Authorization'] = 'Bearer ${_microgen.token}';
    }

    final response = await http.Client().send(request);

    return handleResponse(response);
  }

  Future<dynamic> updateById(String id, Map<String, dynamic> data) async {
    if (id == "") {
      return errorMsg("id is required");
    }

    final url = Uri.parse('$_baseUrl/$id');

    final request = http.Request('DELETE', url);

    if (_microgen.token != null) {
      request.headers['Authorization'] = 'Bearer ${_microgen.token}';
    }

    final response = await http.Client().send(request);

    return handleResponse(response);
  }
}
