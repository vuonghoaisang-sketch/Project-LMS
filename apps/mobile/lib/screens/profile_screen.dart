import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _showMessage(BuildContext context, String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F5F9),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Card(
                color: Colors.white,
                elevation: 4,
                margin: EdgeInsets.zero,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        // Ảnh bìa
                        SizedBox(
                          width: double.infinity,
                          height: 160,
                          child: ClipRRect(
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(20),
                            ),
                            child: Image.network(
                              'https://picsum.photos/id/1015/900/400',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: const Color(0xFFB7D5E8),
                                  child: const Icon(
                                    Icons.landscape,
                                    size: 60,
                                    color: Colors.white,
                                  ),
                                );
                              },
                            ),
                          ),
                        ),

                        // Ảnh đại diện đè lên ranh giới ảnh bìa
                        Positioned(
                          bottom: -54,
                          left: 0,
                          right: 0,
                          child: Center(
                            child: CircleAvatar(
                              radius: 58,
                              backgroundColor: Colors.white,
                              child: CircleAvatar(
                                radius: 51,
                                backgroundColor: const Color(0xFFE3EDFF),
                                backgroundImage: const NetworkImage(''),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    // Chừa chỗ cho ảnh đại diện
                    const SizedBox(height: 64),

                    // 2. HỌ TÊN
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'Vương Hoài Sang',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 23,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                    ),

                    const SizedBox(height: 6),

                    // 3. NGHỀ NGHIỆP
                    const Text(
                      'Sinh Viên',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 14, color: Color(0xFF9CA3AF)),
                    ),

                    const SizedBox(height: 26),

                    // 4. BA CỘT SỐ LIỆU
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Row(
                        children: [
                          Expanded(child: _buildStat('128', 'Bài viết')),
                          Expanded(child: _buildStat('1.2K', 'Người theo dõi')),
                          Expanded(child: _buildStat('350', 'Đang theo dõi')),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // ĐƯỜNG KẺ PHÂN CÁCH
                    const Divider(
                      thickness: 1,
                      height: 1,
                      indent: 20,
                      endIndent: 20,
                      color: Color(0xFFE5E7EB),
                    ),

                    const SizedBox(height: 20),

                    // 5. HAI NÚT THEO TỈ LỆ 3:2
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: SizedBox(
                              height: 48,
                              child: FilledButton.icon(
                                onPressed: () {
                                  _showMessage(context, 'Bạn đã nhấn Theo dõi');
                                },
                                icon: const Icon(
                                  Icons.person_add_alt_1,
                                  size: 18,
                                ),
                                label: const Text('Theo dõi'),
                                style: FilledButton.styleFrom(
                                  backgroundColor: const Color(0xFF2563EB),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                  ),
                                ),
                              ),
                            ),
                          ),

                          const SizedBox(width: 10),

                          Expanded(
                            flex: 2,
                            child: SizedBox(
                              height: 48,
                              child: OutlinedButton.icon(
                                onPressed: () {
                                  _showMessage(context, 'Bạn đã nhấn Nhắn tin');
                                },
                                icon: const Icon(
                                  Icons.chat_bubble_outline,
                                  size: 18,
                                ),
                                label: const Text('Nhắn tin'),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: const Color(0xFF2563EB),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  // Widget hiển thị một cột số liệu
  Widget _buildStat(String number, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          number,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
        ),
      ],
    );
  }
}
