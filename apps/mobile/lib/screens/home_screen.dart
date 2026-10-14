import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _showCallingMessage(BuildContext context) {
    final messenger = ScaffoldMessenger.of(context);

    messenger.hideCurrentSnackBar();
    messenger.showSnackBar(
      const SnackBar(
        content: Text(
          'Đang gọi cho bạn của bạn',
          style: TextStyle(color: Colors.white, fontSize: 15),
        ),
        backgroundColor: Colors.black,
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 3),
        margin: EdgeInsets.fromLTRB(16, 0, 16, 20),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // TIÊU ĐỀ Ở GIỮA
              const Center(
                child: Text(
                  'THÔNG TIN SINH VIÊN',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 23,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1F2937),
                  ),
                ),
              ),

              const SizedBox(height: 8),

              const Center(
                child: Text(
                  'Danh sách thông tin liên hệ',
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
              ),

              const SizedBox(height: 24),

              // THẺ SINH VIÊN
              Card(
                color: Colors.white,
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      // AVATAR
                      const CircleAvatar(
                        radius: 30,
                        backgroundColor: Color(0xFFE3EDFF),
                        child: Icon(
                          Icons.person,
                          size: 36,
                          color: Color(0xFF2563EB),
                        ),
                      ),

                      const SizedBox(width: 14),

                      // TÊN VÀ LỚP
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Nguyễn Văn An',
                              style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1F2937),
                              ),
                            ),
                            SizedBox(height: 7),
                            Text(
                              'Lớp: CNTT K47',
                              style: TextStyle(
                                fontSize: 14,
                                color: Color(0xFF6B7280),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: 8),

                      // NÚT GỌI ĐIỆN
                      Builder(
                        builder: (buttonContext) {
                          return IconButton(
                            tooltip: 'Bấm để gọi',
                            onPressed: () {
                              _showCallingMessage(buttonContext);
                            },
                            style: IconButton.styleFrom(
                              backgroundColor: const Color(0xFF2563EB),
                              foregroundColor: Colors.white,
                              fixedSize: const Size(48, 48),
                            ),
                            icon: const Icon(Icons.phone, size: 23),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
