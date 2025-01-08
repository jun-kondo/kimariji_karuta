export function shuffleArray(array) {
    return [...array].sort(() => 0.5 - Math.random());
} 