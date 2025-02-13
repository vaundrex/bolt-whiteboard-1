import React, { useState, useEffect } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { PlusCircle } from 'lucide-react';

function App() {
  const [rooms, setRooms] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load rooms from server
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      setError('Failed to load rooms');
      console.error('Error fetching rooms:', err);
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newRoomName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      await fetchRooms();
      setCurrentRoom(newRoomName);
      setNewRoomName('');
      setError('');
    } catch (err) {
      setError('Failed to create room');
      console.error('Error creating room:', err);
    }
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Collaborative Whiteboard
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Create a new room or join an existing one
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={createRoom} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter room name"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Room
              </button>
            </div>
          </form>

          {rooms.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Existing Rooms
              </h3>
              <div className="space-y-2">
                {rooms.map((room) => (
                  <button
                    key={room}
                    onClick={() => setCurrentRoom(room)}
                    className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow-sm px-4 py-2 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Room: {currentRoom}</h1>
        <button
          onClick={() => setCurrentRoom('')}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Exit Room
        </button>
      </div>
      <div className="flex-1">
        <Tldraw 
          persistenceKey={`whiteboard-${currentRoom}`}
          syncServer={{
            url: `ws://localhost:3001`,
            roomId: currentRoom,
          }}
        />
      </div>
    </div>
  );
}

export default App;