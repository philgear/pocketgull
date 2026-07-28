import 'web_download_stub.dart'
    if (dart.library.html) 'web_download_web.dart';

void triggerWebDownload(String jsonString, String fileName) {
  downloadWebFile(jsonString, fileName);
}
