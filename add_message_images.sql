-- Add image_url and message_type columns to direct_messages table
ALTER TABLE direct_messages 
ADD COLUMN image_url TEXT,
ADD COLUMN message_type VARCHAR(20) DEFAULT 'text';

-- Add image_url and message_type columns to group_messages table
ALTER TABLE group_messages 
ADD COLUMN image_url TEXT,
ADD COLUMN message_type VARCHAR(20) DEFAULT 'text';

-- Create indexes for the new columns
CREATE INDEX idx_direct_messages_message_type ON direct_messages(message_type);
CREATE INDEX idx_group_messages_message_type ON group_messages(message_type);
