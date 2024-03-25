// remove "data: " if it exists
export const parseChunk = (chunk: string): string => chunk.match(/(data:|error:)?(.*)/).pop() || ''; 
