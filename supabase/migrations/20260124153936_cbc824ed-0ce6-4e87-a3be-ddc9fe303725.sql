-- Enable realtime for chat_rooms table so room list updates
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;