class StorageManager {
    static saveScore(gameName, score) {
        const scores = this.getScores(gameName);
        scores.push({
            score: score,
            date: new Date().toISOString()
        });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10); // Keep top 10
        localStorage.setItem(`${gameName}_scores`, JSON.stringify(scores));
    }

    static getScores(gameName) {
        const scores = localStorage.getItem(`${gameName}_scores`);
        return scores ? JSON.parse(scores) : [];
    }

    static getHighScore(gameName) {
        const scores = this.getScores(gameName);
        return scores.length > 0 ? scores[0].score : 0;
    }

    static saveGameState(gameName, state) {
        localStorage.setItem(`${gameName}_state`, JSON.stringify(state));
    }

    static getGameState(gameName) {
        const state = localStorage.getItem(`${gameName}_state`);
        return state ? JSON.parse(state) : null;
    }

    static clearGameState(gameName) {
        localStorage.removeItem(`${gameName}_state`);
    }

    static saveSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    static getSettings() {
        const settings = localStorage.getItem('settings');
        return settings ? JSON.parse(settings) : { soundEnabled: true };
    }
}