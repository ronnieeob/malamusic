/*
  # Seed initial data for Metal Aloud

  1. Content
    - Insert genres
    - Insert bands
    - Insert songs
    - Create relationships between bands and genres
*/

-- Insert genres
INSERT INTO genres (id, name, description, image_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Heavy Metal', 'The classic metal sound that started it all', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee'),
  ('22222222-2222-2222-2222-222222222222', 'Thrash Metal', 'Fast, aggressive, and technically complex', 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c'),
  ('33333333-3333-3333-3333-333333333333', 'Death Metal', 'Extreme metal with deep growls and intense riffs', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'),
  ('44444444-4444-4444-4444-444444444444', 'Black Metal', 'Raw, atmospheric, and often symphonic', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f');

-- Insert bands
INSERT INTO bands (id, name, formed_in, image_url) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Metallica', '1981', 'https://images.unsplash.com/photo-1629276301820-0f3eedc29fd0'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Black Sabbath', '1968', 'https://images.unsplash.com/photo-1548778943-5bbeeb0d056f'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Slayer', '1981', 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Megadeth', '1983', 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6');

-- Create band-genre relationships
INSERT INTO band_genres (band_id, genre_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222');

-- Insert songs
INSERT INTO songs (id, title, artist, album, cover_url, audio_url, duration, band_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Master of Puppets', 'Metallica', 'Master of Puppets', 'https://images.unsplash.com/photo-1629276301820-0f3eedc29fd0', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 30, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-2222-2222-2222-222222222222', 'War Pigs', 'Black Sabbath', 'Paranoid', 'https://images.unsplash.com/photo-1548778943-5bbeeb0d056f', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 30, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('33333333-3333-3333-3333-333333333333', 'Raining Blood', 'Slayer', 'Reign in Blood', 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 30, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('44444444-4444-4444-4444-444444444444', 'Holy Wars', 'Megadeth', 'Rust in Peace', 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 30, 'dddddddd-dddd-dddd-dddd-dddddddddddd');