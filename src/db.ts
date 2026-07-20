import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

export interface DBState {
  users: any[];
  requests: any[];
  announcements: any[];
  messMenu: any[];
  rooms: any[];
  otps: Record<string, { otp: string; expires: number }>;
}

// Local fallback JSON file for development without PostgreSQL
const LOCAL_DB_FILE = path.join(process.cwd(), 'vsb_hostel_db.json');

// PostgreSQL client setup (only when DATABASE_URL is provided)
const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } }) : null;

function getDefaultState(): DBState {
  const defaultRooms: any[] = [];
  for (let i = 1; i <= 100; i++) {
    let block = '';
    if (i <= 25) block = 'Block A';
    else if (i <= 50) block = 'Block B';
    else if (i <= 75) block = 'Block C';
    else block = 'Block D';

    defaultRooms.push({
      id: `room-${i}`,
      block,
      roomNo: i.toString(),
      capacity: 4,
      occupied: 0,
      status: 'Available'
    });
  }

  return {
    users: [],
    requests: [],
    announcements: [
      { id: 'ann-1', title: 'Curfew Protocol Warning', content: 'Curfew lockdown commences strictly at 21:00 hours. High-priority scans will flag unauthorized outer movements.', date: new Date().toISOString(), priority: 'High' },
      { id: 'ann-2', title: 'Warden Room Registry Audits', content: 'Chief Warden Muthusamy will hold visual matrix reviews of Sector Block A rooms this Saturday.', date: new Date().toISOString(), priority: 'Normal' },
    ],
    messMenu: [
      { day: 'Monday', breakfast: 'Ghee Podi Idli, Sambar, Coconut Chutney, Tea/Coffee', lunch: 'Rich Veg Biryani, Onion Raitha, Paneer Gravy, Curd Rice', snacks: 'Hot Onion Pakoda, Ginger Tea', dinner: 'Butter Chapathi, Chenna Masala, Hot Milk' },
      { day: 'Tuesday', breakfast: 'Crispy Poori, Potato Masala, Vadacurry, Coffee', lunch: 'Sambar Rice, Potato Fry, Appalam, Elaneer Payasam', snacks: 'Sweet Kozhukattai, Tea', dinner: 'Kalyana Veg Kurma, Parotta, Warm Milk' },
      { day: 'Wednesday', breakfast: 'Rava Upma, Coconut & Tomato Chutney, Tea', lunch: 'Kara Kuzhambu, Beetroot Poriyal, Curd, Rice', snacks: 'Samosa, Cardamom Tea', dinner: 'Jeera Rice, Dal Makhani, Fresh Fruits' },
      { day: 'Thursday', breakfast: 'Kambarasam Pongal, Medu Vada, Sambar, Coffee', lunch: 'Thali Meals, Veg Poriyal, Rasam, Butter Milk', snacks: 'Kala Chana Sundal, Tea', dinner: 'Idiyappam, Coconut Milk, Kadala Curry' },
      { day: 'Friday', breakfast: 'Onion Uttapam, Mint Chutney, Sambar, Tea', lunch: 'Lemon Rice, Potato Masala, Curd Rice, Pickles', snacks: 'Banana Fritters, Coffee', dinner: 'Wheat Chapathi, Mixed Veg Gravy, Milk' },
      { day: 'Saturday', breakfast: 'Semiya Upma, Tomato Chutney, Tea', lunch: 'Bisi Bele Bath, Potato Chips, Curd, Fruit Salad', snacks: 'Parippu Vada, Black Tea', dinner: 'Aloo Paratha, Curd, Pickles, Warm Milk' },
      { day: 'Sunday', breakfast: 'Special Masala Dosa, Sambar, Chutney, Coffee', lunch: 'Chief Chef Biryani, Veg Gravy, Sweet Kesari', snacks: 'Mixed Veg Cutlet, Tea', dinner: 'Phulka, Kadai Paneer, Hot Milk' },
    ],
    rooms: defaultRooms,
    otps: {}
  };
}

export async function initDB(): Promise<void> {
  if (!pool) {
    console.log('DATABASE_URL not set. Using local JSON file persistence.');
    return;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        state JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default state if row doesn't exist
    const result = await pool.query('SELECT state FROM app_state WHERE id = 1');
    if (result.rowCount === 0) {
      await pool.query(
        'INSERT INTO app_state (id, state) VALUES (1, $1)',
        [JSON.stringify(getDefaultState())]
      );
      console.log('PostgreSQL database initialized with default state.');
    } else {
      console.log('PostgreSQL database connected and state loaded.');
    }
  } catch (err: any) {
    console.error('Failed to initialize PostgreSQL database:', err.message);
    throw err;
  }
}

export async function readDB(): Promise<DBState> {
  if (!pool) {
    // Local JSON fallback
    if (!fs.existsSync(LOCAL_DB_FILE)) {
      const state = getDefaultState();
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(state, null, 2));
      return state;
    }

    try {
      const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
      return JSON.parse(raw);
    } catch {
      return { users: [], requests: [], announcements: [], messMenu: [], rooms: [], otps: {} };
    }
  }

  try {
    const result = await pool.query('SELECT state FROM app_state WHERE id = 1');
    if (result.rowCount === 0) {
      const state = getDefaultState();
      await pool.query('INSERT INTO app_state (id, state) VALUES (1, $1)', [JSON.stringify(state)]);
      return state;
    }
    return result.rows[0].state as DBState;
  } catch (err: any) {
    console.error('Failed to read from PostgreSQL:', err.message);
    throw err;
  }
}

export async function writeDB(state: DBState): Promise<void> {
  if (!pool) {
    // Local JSON fallback
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(state, null, 2));
    return;
  }

  try {
    await pool.query(
      'UPDATE app_state SET state = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [JSON.stringify(state)]
    );
  } catch (err: any) {
    console.error('Failed to write to PostgreSQL:', err.message);
    throw err;
  }
}
