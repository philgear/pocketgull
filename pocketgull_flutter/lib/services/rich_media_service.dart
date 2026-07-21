/// Rich Media Service — 3D model registry, PHIL images, Wikimedia, PubMed.
///
/// Flutter parity with Angular `rich-media.service.ts` (292 lines).
/// Provides curated model/image registries and network search methods
/// for Wikimedia Commons images and PubMed citations.
library;

import 'dart:convert';
import 'package:http/http.dart' as http;

// ── Types ──────────────────────────────────────────────────────────

class ThreeJsModel {
  final String id;
  final String name;
  final String description;
  final String threejsId;
  const ThreeJsModel({required this.id, required this.name,
      required this.description, required this.threejsId});
}

class WikimediaImage {
  final String title;
  final String url;
  final String thumbUrl;
  final String descriptionUrl;
  final String credit;
  final String license;
  const WikimediaImage({required this.title, required this.url,
      required this.thumbUrl, required this.descriptionUrl,
      required this.credit, required this.license});
}

class PubmedCitation {
  final String pmid;
  final String title;
  final String authors;
  final String journal;
  final String year;
  final String url;
  const PubmedCitation({required this.pmid, required this.title,
      required this.authors, required this.journal,
      required this.year, required this.url});
}

class PhilImage {
  final int id;
  final String url;
  final String thumbUrl;
  final String title;
  final String credit;
  const PhilImage({required this.id, required this.url,
      required this.thumbUrl, required this.title, required this.credit});
}

// ── Curated Registries ─────────────────────────────────────────────

const _threejsRegistry = <String, List<ThreeJsModel>>{
  'spine': [ThreeJsModel(id: 'spine', name: 'Vertebral Column', description: 'Procedural spine segment', threejsId: 'spine')],
  'heart': [ThreeJsModel(id: 'heart', name: 'Human Heart', description: 'Procedural cardiac form', threejsId: 'heart')],
  'brain': [ThreeJsModel(id: 'brain', name: 'Human Brain', description: 'Procedural neurological visualization', threejsId: 'brain')],
  'lungs': [ThreeJsModel(id: 'lungs', name: 'Human Lungs', description: 'Procedural pulmonary system', threejsId: 'lungs')],
  'default': [ThreeJsModel(id: 'generic', name: 'Organ System Reference', description: 'Procedural internal volume reference', threejsId: 'generic')],
};

const _philRegistry = <String, List<PhilImage>>{
  'spine': [PhilImage(id: 9501, url: 'https://wwwn.cdc.gov/phil/PHIL_Images/9501/9501.jpg', thumbUrl: 'https://wwwn.cdc.gov/phil/PHIL_Images/9501/9501_lores.jpg', title: 'Spinal anatomy diagram', credit: 'CDC/PHIL')],
  'pain': [PhilImage(id: 23258, url: 'https://wwwn.cdc.gov/phil/PHIL_Images/23258/23258.jpg', thumbUrl: 'https://wwwn.cdc.gov/phil/PHIL_Images/23258/23258_lores.jpg', title: 'Chronic pain clinical assessment', credit: 'CDC/PHIL')],
  'default': [PhilImage(id: 11162, url: 'https://wwwn.cdc.gov/phil/PHIL_Images/11162/11162.jpg', thumbUrl: 'https://wwwn.cdc.gov/phil/PHIL_Images/11162/11162_lores.jpg', title: 'Clinical care setting', credit: 'CDC/PHIL')],
};

// ── Service ────────────────────────────────────────────────────────

class RichMediaService {
  List<ThreeJsModel> getThreeJsModels(String query) {
    final q = query.toLowerCase();
    for (final key in _threejsRegistry.keys) {
      if (key == 'default') continue;
      if (q.contains(key)) return _threejsRegistry[key]!;
    }
    return _threejsRegistry['default']!;
  }

  List<PhilImage> getPhilImages(String query) {
    final q = query.toLowerCase();
    for (final key in _philRegistry.keys) {
      if (key == 'default') continue;
      if (q.contains(key)) return _philRegistry[key]!;
    }
    return _philRegistry['default']!;
  }

  /// Searches Wikimedia Commons for medical/anatomical images.
  Future<List<WikimediaImage>> searchWikimediaImages(String query, {int limit = 6}) async {
    final simplified = _simplifyQuery(query);
    var results = await _fetchWikimedia(simplified, limit);
    if (results.isNotEmpty) return results;

    final firstWord = simplified.split(' ').first;
    if (firstWord != simplified) {
      results = await _fetchWikimedia(firstWord, limit);
      if (results.isNotEmpty) return results;
    }

    return _fetchWikimedia(query.split(' ').take(3).join(' '), limit);
  }

  /// Searches PubMed for citations.
  Future<List<PubmedCitation>> searchPubmed(String query, {int limit = 3}) async {
    try {
      final encoded = Uri.encodeComponent(query);
      final searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=$encoded&retmax=$limit&retmode=json&sort=relevance';
      final searchRes = await http.get(Uri.parse(searchUrl));
      final searchData = jsonDecode(searchRes.body) as Map<String, dynamic>;
      final ids = List<String>.from((searchData['esearchresult']?['idlist'] as List?) ?? []);
      if (ids.isEmpty) return [];

      final summaryUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json';
      final summaryRes = await http.get(Uri.parse(summaryUrl));
      final summaryData = jsonDecode(summaryRes.body) as Map<String, dynamic>;
      final result = summaryData['result'] as Map<String, dynamic>? ?? {};

      return ids.map((id) {
        final doc = result[id] as Map<String, dynamic>?;
        if (doc == null) return null;
        final authors = (doc['authors'] as List? ?? [])
            .take(3).map((a) => (a as Map)['name'] ?? '').join(', ');
        final totalAuthors = (doc['authors'] as List?)?.length ?? 0;
        return PubmedCitation(
          pmid: id,
          title: doc['title'] as String? ?? '',
          authors: '$authors${totalAuthors > 3 ? " et al." : ""}',
          journal: doc['source'] as String? ?? '',
          year: (doc['pubdate'] as String? ?? '').split(' ').first,
          url: 'https://pubmed.ncbi.nlm.nih.gov/$id/',
        );
      }).whereType<PubmedCitation>().toList();
    } catch (_) {
      return [];
    }
  }

  // ── Helpers ──

  String _simplifyQuery(String query) {
    const stop = {'physical', 'examination', 'assessment', 'evaluation',
        'findings', 'clinical', 'medical', 'anatomy', 'and', 'or', 'of',
        'the', 'a', 'in', 'with', 'for', 'to', 'from', 'by', 'at', 'on',
        'overview', 'management', 'treatment', 'approach', 'general',
        'imaging', 'review', 'related', 'relevant', 'associated'};
    final words = query.toLowerCase()
        .replaceAll(RegExp(r'[^a-z\s]'), ' ')
        .split(RegExp(r'\s+'))
        .where((w) => w.length > 2 && !stop.contains(w))
        .take(2)
        .toList();
    return words.isNotEmpty ? words.join(' ') : query.split(' ').take(2).join(' ');
  }

  Future<List<WikimediaImage>> _fetchWikimedia(String searchTerm, int limit) async {
    try {
      final encoded = Uri.encodeComponent('$searchTerm anatomy');
      final url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=$encoded&gsrlimit=$limit&prop=imageinfo&iiprop=url|descriptionurl|extmetadata&iiurlwidth=400&format=json&origin=*';
      final res = await http.get(Uri.parse(url));
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final pages = (data['query']?['pages'] as Map<String, dynamic>?) ?? {};

      return pages.values.map((p) {
        final page = p as Map<String, dynamic>;
        final ii = ((page['imageinfo'] as List?)?.firstOrNull as Map<String, dynamic>?);
        if (ii == null || ii['url'] == null) return null;
        final meta = ii['extmetadata'] as Map<String, dynamic>? ?? {};
        var credit = (meta['Credit'] as Map?)?['value'] as String? ?? 'Wikimedia Commons';
        credit = credit.replaceAll(RegExp(r'<[^>]+>'), '');
        return WikimediaImage(
          title: (page['title'] as String? ?? '').replaceFirst('File:', ''),
          url: ii['url'] as String,
          thumbUrl: (ii['thumburl'] ?? ii['url']) as String,
          descriptionUrl: ii['descriptionurl'] as String? ?? '',
          credit: credit,
          license: (meta['LicenseShortName'] as Map?)?['value'] as String? ?? 'See source',
        );
      }).whereType<WikimediaImage>()
          .where((img) => RegExp(r'\.(jpg|jpeg|png|svg|webp)$', caseSensitive: false).hasMatch(img.url))
          .toList();
    } catch (_) {
      return [];
    }
  }
}
