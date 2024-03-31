import { Server } from 'socket.io';

// Global variable instance for IO 
let io;

/**
 * Generates an IO object based on the provided server.
 * 
 * @param {Object} server - The object server to generate IO
 * @returns {Object} The generated IO object
 */
export function generateIO(server){
    
    // Create a new Socke.io server instance based on the provided server and set cors to allow connection from any origin
    io=new Server(server,{cors:'*'});

    // Return the generated IO object
    return io;
}
/**
 * Get the socketIO instance
 * 
 * @returns {Server} The socketIO instance
 */
export function getIO(){

    // Check if the IO instance is ibnitialized or not 
    if(!io){

        // If not initialize, throw an error
        throw new Error('Socket.io not initialized');
    }

    // If it is initialized return socketIO instnace
    return io;
}
