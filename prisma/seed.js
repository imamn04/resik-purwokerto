const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding database Resik Purwokerto...");

  // 1. Seed Master Data Layanan
  const services = [
    { name: "Cleaning Kasur", category: "CLEANING", defaultPrice: 150000 },
    { name: "Cleaning Sofa", category: "CLEANING", defaultPrice: 180000 },
    { name: "Cleaning Karpet", category: "CLEANING", defaultPrice: 120000 },
    { name: "Cleaning Rumah & Gedung", category: "CLEANING", defaultPrice: 350000 },
    { name: "Cuci AC (Split)", category: "AC", defaultPrice: 75000 },
    { name: "Instalasi / Pasang AC", category: "AC", defaultPrice: 250000 },
    { name: "Layanan Kelistrikan", category: "KELISTRIKAN", defaultPrice: 100000 },
    { name: "Service Lainnya / General Service", category: "LAINNYA", defaultPrice: 50000 },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: s });
      console.log(`✅ Layanan ditambahkan: ${s.name}`);
    }
  }

  // 2. Hash Password Default untuk Akun Awal
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("password123", salt);

  // 3. Seed Pengguna Awal
  const users = [
    {
      name: "Owner Resik Purwokerto",
      username: "owner",
      email: "owner@resikpurwokerto.com",
      password: defaultPasswordHash,
      role: "OWNER",
      phone: "081234567890",
      isActive: true,
    },
    {
      name: "Admin Operasional",
      username: "admin",
      email: "admin@resikpurwokerto.com",
      password: defaultPasswordHash,
      role: "ADMIN",
      phone: "081234567891",
      isActive: true,
    },
    {
      name: "Budi Santoso (Staff Lapangan)",
      username: "staf1",
      email: "staf1@resikpurwokerto.com",
      password: defaultPasswordHash,
      role: "STAFF_INPUT",
      phone: "081234567892",
      isActive: true,
    },
    {
      name: "Pengawas Eksternal",
      username: "viewer",
      email: "viewer@resikpurwokerto.com",
      password: defaultPasswordHash,
      role: "VIEWER",
      phone: "081234567893",
      isActive: true,
    },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { username: u.username } });
    if (!existing) {
      await prisma.user.create({ data: u });
      console.log(`👤 Pengguna dibuat: ${u.username} (${u.role})`);
    }
  }

  console.log("✨ Seeding selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

