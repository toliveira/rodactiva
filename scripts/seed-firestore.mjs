import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
// Use default database
const db = getFirestore(app, '(default)');

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

const routes = [
  {
    name: 'Percurso BTT 35km',
    description: 'Percurso de BTT de 35km pelos trilhos de Castro Marim. Ideal para iniciados e intermédios.',
    distance: '35 km',
    elevation: '450 m',
    duration: '2h 30m - 3h',
    difficulty: 'médio',
    type: 'btt',
    gpxUrl: '#',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Percurso BTT 60km',
    description: 'Percurso desafiante de 60km para ciclistas experientes. Trilhos técnicos e vistas espetaculares.',
    distance: '60 km',
    elevation: '800 m',
    duration: '4h - 5h',
    difficulty: 'difícil',
    type: 'btt',
    gpxUrl: '#',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Trail Urbano 15km',
    description: 'Percurso de trail de 15km pelos monumentos históricos de Castro Marim.',
    distance: '15 km',
    elevation: '200 m',
    duration: '1h 30m - 2h',
    difficulty: 'fácil',
    type: 'trail',
    gpxUrl: '#',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Trail Urbano 25km',
    description: 'Percurso de trail de 25km com vistas panorâmicas e passagens por locais históricos.',
    distance: '25 km',
    elevation: '350 m',
    duration: '2h 30m - 3h 30m',
    difficulty: 'médio',
    type: 'trail',
    gpxUrl: '#',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Caminhada Noturna 6km',
    description: 'Caminhada noturna de 6km pelos sítios mais emblemáticos de Castro Marim.',
    distance: '6 km',
    elevation: '80 m',
    duration: '1h 30m - 2h',
    difficulty: 'fácil',
    type: 'caminhada',
    gpxUrl: '#',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

const galleryItems = [
  {
    type: 'photo',
    title: 'Por Trilhos de Castro Marim 2024',
    description: 'Fotos do evento de BTT de 2024',
    thumbnail: 'https://images.unsplash.com/photo-1511522783486-a01980e01a18?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1511522783486-a01980e01a18?w=1200&h=800&fit=crop',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    type: 'photo',
    title: 'Resistência Noturna 2024',
    description: 'Momentos da prova noturna',
    thumbnail: 'https://images.unsplash.com/photo-1552674605-5defe6aa44bb?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1552674605-5defe6aa44bb?w=1200&h=800&fit=crop',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    type: 'photo',
    title: 'Trail Urbano 2024',
    description: 'Participantes no trail urbano',
    thumbnail: 'https://images.unsplash.com/photo-1606187512519-c6ecdc1359fc?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1606187512519-c6ecdc1359fc?w=1200&h=800&fit=crop',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    type: 'video',
    title: 'Vídeo Promocional 2024',
    description: 'Highlights dos eventos de 2024',
    thumbnail: 'https://images.unsplash.com/photo-1485579149c0-123123123123?w=400&h=300&fit=crop',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    type: 'photo',
    title: 'Caminhada Halloween 2023',
    description: 'Momentos da caminhada noturna',
    thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&h=800&fit=crop',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

const members = [
  {
    name: 'João Silva',
    role: 'Fundador & Coordenador',
    bio: 'Apaixonado por desporto outdoor com mais de 15 anos de experiência em BTT e organização de eventos.',
    specialty: 'BTT, Organização',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Maria Santos',
    role: 'Coordenadora de Eventos',
    bio: 'Especialista em logística e coordenação de eventos desportivos de grande escala.',
    specialty: 'Eventos, Logística',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Pedro Costa',
    role: 'Responsável de Segurança',
    bio: 'Profissional de segurança com certificação em primeiros socorros e resgate em montanha.',
    specialty: 'Segurança, Resgate',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Ana Oliveira',
    role: 'Coordenadora de Comunicação',
    bio: 'Responsável pela comunicação e marketing da associação nas redes sociais e media.',
    specialty: 'Marketing, Comunicação',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

const usefulLinks = [
  {
    title: 'Câmara Municipal de Castro Marim',
    url: 'https://www.cm-castromarim.pt/',
    category: 'government',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: 'Federação Portuguesa de Ciclismo',
    url: 'https://www.federacaociclismo.pt/',
    category: 'sports',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: 'ICNF - Instituto da Conservação da Natureza e Florestas',
    url: 'https://www.icnf.pt/',
    category: 'nature',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: 'Junta de Freguesia de Castro Marim',
    url: 'https://www.jf-castromarim.pt/',
    category: 'government',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

async function seedFirestore() {
  try {
    console.log('Starting Firestore seeding...');
    console.log('Using Firebase project:', firebaseConfig.projectId);

    // Add events
    console.log('Adding events...');
    for (const event of events) {
      const docRef = await addDoc(collection(db, 'events'), event);
      console.log('  ✓ Event added:', docRef.id);
    }

    // Add routes
    console.log('Adding routes...');
    for (const route of routes) {
      const docRef = await addDoc(collection(db, 'routes'), route);
      console.log('  ✓ Route added:', docRef.id);
    }

    // Add gallery items
    console.log('Adding gallery items...');
    for (const item of galleryItems) {
      const docRef = await addDoc(collection(db, 'gallery'), item);
      console.log('  ✓ Gallery item added:', docRef.id);
    }

    // Add members
    console.log('Adding team members...');
    for (const member of members) {
      const docRef = await addDoc(collection(db, 'members'), member);
      console.log('  ✓ Member added:', docRef.id);
    }

    // Add useful links
    console.log('Adding useful links...');
    for (const link of usefulLinks) {
      const docRef = await addDoc(collection(db, 'usefulLinks'), link);
      console.log('  ✓ Link added:', docRef.id);
    }

    console.log('✅ Firestore seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

seedFirestore();
