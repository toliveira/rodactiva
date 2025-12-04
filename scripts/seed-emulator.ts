import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
// When running against emulator, we don't need credentials if GCLOUD_PROJECT is set
// and emulator hosts are defined in env vars (which they are in .env.local)
const app = initializeApp({
    projectId: process.env.GCLOUD_PROJECT || 'rodactiva-c1b0b',
});

const db = getFirestore(app);
const auth = getAuth(app);

console.log(`✅ Connected to Firebase Admin (Project: ${process.env.GCLOUD_PROJECT})`);
console.log(`   Firestore Host: ${process.env.FIRESTORE_EMULATOR_HOST}`);
console.log(`   Auth Host: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);

// Sample data
const sampleEvents = [
    {
        title: 'Caminhada de Verão',
        description: 'Uma caminhada relaxante pela costa algarvia',
        date: Timestamp.fromDate(new Date('2025-07-15')),
        location: 'Castro Marim',
        imageUrl: '/events-header.jpg',
        maxParticipants: 30,
        registeredParticipants: 0,
        createdAt: Timestamp.now(),
    },
    {
        title: 'Passeio de Bicicleta',
        description: 'Explore os trilhos de Castro Marim de bicicleta',
        date: Timestamp.fromDate(new Date('2025-08-20')),
        location: 'Castro Marim',
        imageUrl: '/events-header.jpg',
        maxParticipants: 25,
        registeredParticipants: 0,
        createdAt: Timestamp.now(),
    },
];

const sampleRoutes = [
    {
        name: 'Trilho da Praia Verde',
        description: 'Um percurso costeiro espetacular',
        distance: 8.5,
        difficulty: 'Fácil',
        duration: '2-3 horas',
        gpxUrl: '',
        imageUrl: '/hero-background.jpg',
        createdAt: Timestamp.now(),
    },
    {
        name: 'Rota do Sapal',
        description: 'Descubra a biodiversidade do sapal de Castro Marim',
        distance: 12.0,
        difficulty: 'Moderado',
        duration: '3-4 horas',
        gpxUrl: '',
        imageUrl: '/hero-background.jpg',
        createdAt: Timestamp.now(),
    },
];

const sampleMembers = [
    {
        name: 'João Silva',
        role: 'Presidente',
        imageUrl: '',
        bio: 'Fundador da Rodactiva',
        joinedAt: Timestamp.fromDate(new Date('2020-01-01')),
    },
    {
        name: 'Maria Santos',
        role: 'Vice-Presidente',
        imageUrl: '',
        bio: 'Apaixonada por caminhadas',
        joinedAt: Timestamp.fromDate(new Date('2020-03-15')),
    },
];

async function seedData() {
    try {
        console.log('🌱 Starting data seeding...');

        // Seed events
        console.log('📅 Seeding events...');
        for (const event of sampleEvents) {
            await db.collection('events').add(event);
        }
        console.log(`✅ Added ${sampleEvents.length} events`);

        // Seed routes
        console.log('🗺️  Seeding routes...');
        for (const route of sampleRoutes) {
            await db.collection('routes').add(route);
        }
        console.log(`✅ Added ${sampleRoutes.length} routes`);

        // Seed members
        console.log('👥 Seeding members...');
        for (const member of sampleMembers) {
            await db.collection('members').add(member);
        }
        console.log(`✅ Added ${sampleMembers.length} members`);

        console.log('🎉 Data seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

// Run the seed function
seedData();
