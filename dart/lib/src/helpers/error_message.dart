Map<String, Map<String, String?>> errorMsg(String? msg) {
  final err = {
    'error': {'message': msg}
  };

  return err;
}
