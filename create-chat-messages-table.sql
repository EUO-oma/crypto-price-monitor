-- Create messages table for chat feature
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read messages
CREATE POLICY "Chat messages are viewable by everyone" 
  ON chat_messages FOR SELECT 
  USING (true);

-- Allow anyone to insert messages
CREATE POLICY "Anyone can insert chat messages" 
  ON chat_messages FOR INSERT 
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Limit to last 500 messages
CREATE OR REPLACE FUNCTION limit_chat_messages()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM chat_messages
  WHERE id IN (
    SELECT id FROM chat_messages
    ORDER BY created_at DESC
    OFFSET 500
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS limit_chat_messages_trigger ON chat_messages;
CREATE TRIGGER limit_chat_messages_trigger
  AFTER INSERT ON chat_messages
  FOR EACH STATEMENT
  EXECUTE FUNCTION limit_chat_messages();