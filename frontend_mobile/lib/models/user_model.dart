class UserModel {
  final int id;
  final String nama;
  final String email;
  final String role;
  final String? noHp;

  UserModel({
    required this.id,
    required this.nama,
    required this.email,
    required this.role,
    this.noHp,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      nama: json['nama'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? '',
      noHp: json['noHp'],
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'nama': nama, 'email': email, 'role': role, 'noHp': noHp};
  }
}
