import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final PageController _pageController = PageController(viewportFraction: 0.82);

  int _currentPage = 0;

  final List<String> images = [
    'https://picsum.photos/id/1015/600/350',
    'https://picsum.photos/id/1016/600/350',
    'https://picsum.photos/id/1018/600/350',
    'https://picsum.photos/id/1019/600/350',
    'https://picsum.photos/id/1020/600/350',
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _nextPage() {
    if (_currentPage < images.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Vancouver App'), centerTitle: true),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 15),

            // IMAGE CAROUSEL
            SizedBox(
              height: 250,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  PageView.builder(
                    controller: _pageController,
                    itemCount: images.length,
                    onPageChanged: (index) {
                      setState(() {
                        _currentPage = index;
                      });
                    },
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 5),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            images[index],
                            width: double.infinity,
                            height: 250,
                            fit: BoxFit.cover,
                          ),
                        ),
                      );
                    },
                  ),

                  // NÚT TRÁI
                  Positioned(
                    left: 8,
                    child: GestureDetector(
                      onTap: _previousPage,
                      child: Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.55),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.chevron_left,
                          color: Colors.grey,
                          size: 30,
                        ),
                      ),
                    ),
                  ),

                  // NÚT PHẢI
                  Positioned(
                    right: 8,
                    child: GestureDetector(
                      onTap: _nextPage,
                      child: Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.60),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.chevron_right,
                          color: Colors.grey,
                          size: 30,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 25),

            // TIÊU ĐỀ
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Nước Vancouver xinh đẹp - Vương Hoài Sang',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
            ),

            const SizedBox(height: 30),

            // ACTIONS
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildAction(icon: Icons.phone, label: 'CALL'),
                const SizedBox(width: 45),
                _buildAction(icon: Icons.near_me, label: 'ROUTE'),
                const SizedBox(width: 45),
                _buildAction(icon: Icons.share, label: 'SHARE'),
              ],
            ),

            const SizedBox(height: 30),

            // DESCRIPTION
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Vancouver thực chất là một thành phố cảng biển lớn nằm ở phía tây tỉnh bang British Columbia, Canada'
                'Được mệnh danh là một trong những thành phố đáng sống nhất thế giới.'
                'Vancouver hớp hồn du khách bởi sự hòa quyện tuyệt mỹ giữa nhịp sống đô thị hiện đại và thiên nhiên hùng vĩ'
                'con đường hiện đại. Thành phố mang đến sự kết hợp hài hòa '
                'Nơi đây sở hữu địa thế "tựa sơn hướng hải" độc đáo, nơi những tòa nhà chọc trời bằng kính phản chiếu bãi biển xanh mát'
                'và được bao bọc bởi những dãy núi quanh năm tuyết phủ.',
                textAlign: TextAlign.justify,
                style: TextStyle(fontSize: 16, height: 1.5),
              ),
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  static Widget _buildAction({required IconData icon, required String label}) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 38, color: Colors.blue),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.blue,
          ),
        ),
      ],
    );
  }
}
