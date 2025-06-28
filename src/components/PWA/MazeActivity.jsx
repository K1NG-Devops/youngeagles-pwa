import React, { useState } from 'react';
import { FaRobot } from 'react-icons/fa';

const MazeActivity = () => {
  const [commands, setCommands] = useState('');
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0 });

  const maze = [
    [' ', ' ', ' ', ' ', ' '],
    [' ', 'X', 'X', 'X', ' '],
    [' ', ' ', ' ', 'X', ' '],
    ['X', 'X', ' ', 'X', ' '],
    [' ', ' ', ' ', ' ', 'E']
  ];

  const handleCommandChange = (e) => {
    setCommands(e.target.value);
  };

  const executeCommands = () => {
    const commandList = commands.toUpperCase().split(',');
    let position = { ...robotPosition };

    for (const command of commandList) {
      if (command === 'UP' && position.x > 0) {
        position.x -= 1;
      } else if (command === 'DOWN' && position.x < 4) {
        position.x += 1;
      } else if (command === 'LEFT' && position.y > 0) {
        position.y -= 1;
      } else if (command === 'RIGHT' && position.y < 4) {
        position.y += 1;
      }

      if (maze[position.x][position.y] === 'X') {
        alert('Hit a wall! Try a different command.');
        return;
      }
    }

    setRobotPosition(position);
    if (maze[position.x][position.y] === 'E') {
      alert('Success! The robot reached the end of the maze!');
    }
  };

  return (
    <div className="maze-activity">
      <h2 className="text-xl font-bold mb-4">Maze Navigation Activity</h2>
      <p>Guide the robot to the end of the maze by entering commands such as UP, DOWN, LEFT, RIGHT.</p>

      {/* Maze Display */}
      <div className="maze grid grid-cols-5 gap-2 my-4">
        {maze.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`p-4 border text-center ${
                rowIndex === robotPosition.x && colIndex === robotPosition.y ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {rowIndex === robotPosition.x && colIndex === robotPosition.y ? <FaRobot /> : cell}
            </div>
          ))
        )}
      </div>

      {/* Command Input */}
      <input
        className="p-2 border rounded"
        type="text"
        value={commands}
        onChange={handleCommandChange}
        placeholder="Enter commands separated by commas"
      />
      <button onClick={executeCommands} className="ml-2 px-4 py-2 bg-green-500 text-white rounded">
        Execute
      </button>
    </div>
  );
};

export default MazeActivity;

