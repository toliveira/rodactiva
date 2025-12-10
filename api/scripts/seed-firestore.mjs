// scripts/grant-admin.ts
import { initializeApp, cert } from "firebase-admin/app";
import * as path from "path";
import * as fs from "fs";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, "./firebaseServiceAccount.json");
if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ Service account key not found at:", serviceAccountPath);
    console.error("Please download it from Firebase Console -> Project Settings -> Service Accounts");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

const admin = initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore(admin);
const serverTimestamp = () => FieldValue.serverTimestamp();

// Sample data (without custom IDs - let Firestore generate them)
const events = [
  {
    title: 'Por Trilhos de Castro Marim - X Edição',
    description: 'Raid de BTT com percursos de 35km e 60km. Desafie-se nos trilhos mais bonitos de Castro Marim.',
    date: '2025-03-26',
    location: 'Castro Marim',
    type: 'btt',
    difficulty: 'médio',
    distance: '35km / 60km',
    participants: 150,
    image: 'https://images.unsplash.com/photo-1511522783486-a01980e01a18?w=800&h=600&fit=crop',
    registrationUrl: 'https://www.apedalar.pt/',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: '3h Resistência Noturna - 11ª Edição',
    description: 'Desafio de resistência em trilhos noturnos. A solo ou em equipas duplas, num percurso de 7,5km.',
    date: '2025-05-15',
    location: 'Castro Marim',
    type: 'outro',
    difficulty: 'difícil',
    distance: '7,5km',
    participants: 80,
    image: 'https://images.unsplash.com/photo-1552674605-5defe6aa44bb?w=800&h=600&fit=crop',
    registrationUrl: '#',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: 'Trail Urbano Entre Muralhas',
    description: 'Percursos de trail pelos monumentos históricos de Castro Marim. 15km e 25km de pura aventura.',
    date: '2025-09-20',
    location: 'Castro Marim',
    type: 'trail',
    difficulty: 'médio',
    distance: '15km / 25km',
    participants: 120,
    image: 'https://images.unsplash.com/photo-1606187512519-c6ecdc1359fc?w=800&h=600&fit=crop',
    registrationUrl: '#',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: 'Caminhada Halloween',
    description: 'Caminhada noturna de 6km pelos sítios mais emblemáticos e históricos de Castro Marim.',
    date: '2025-10-31',
    location: 'Castro Marim',
    type: 'caminhada',
    difficulty: 'fácil',
    distance: '6km',
    participants: 200,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop',
    registrationUrl: '#',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

const team = [
  {
    name: 'António Viegas',
    role: 'Presidente',
    category: 'Direcção',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Mario Ribeiro',
    role: 'Vice-Presidente',
    category: 'Direcção',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Carlos Faustino',
    role: 'Secretário',
    category: 'Direcção',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'David Costa',
    role: 'Tesoureiro',
    category: 'Direcção',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Diogo Afonso',
    role: 'Vogal',
    category: 'Direcção',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Pedro Morais',
    role: 'Presidente',
    category: 'Assembleia Geral',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Sandra Rito',
    role: 'Vice-Presidente',
    category: 'Assembleia Geral',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Carlos Santos',
    role: 'Secretario',
    category: 'Assembleia Geral',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Gonçalo Mascarenhas',
    role: 'Presidente',
    category: 'Conselho Fiscal',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Filipa Madeira',
    role: 'Vice-Presidente',
    category: 'Conselho Fiscal',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Marco Rosa',
    role: 'Secretario',
    category: 'Conselho Fiscal',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
];

async function seedFirestore() {
  try {
    console.log('Starting Firestore seeding...');
    console.log('Using Firebase project:', serviceAccount.project_id);

    // Add events
    console.log('Adding events...');
    for (const event of events) {
      // Add event to Firestore with admin sdk
      const docRef = await db.collection('events').add(event);
      console.log('  ✓ Event added:', docRef.id);
    }

    // Add Team
    console.log('Adding team members...');
    for (const person of team) {
      const docRef = await db.collection('team').add(person);
      console.log('  ✓ Team member added:', docRef.id);
    }

    console.log('✅ Firestore seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

seedFirestore();
