import ChatRoomPage from "@/features/chat";

const ChatRoom = ({ params }: { params: Promise<{ roomId: string }> }) => {
  return <ChatRoomPage params={params} />;
};

export default ChatRoom;
