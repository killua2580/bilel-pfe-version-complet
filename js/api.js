/**
 * PHP API Integration for Gym Power Application
 * Provides backend communication with PHP API
 */

class GymPowerAPI {
    constructor() {
        this.baseURL = 'http://localhost/gym-power/backend';
        this.endpoints = {
            auth: `${this.baseURL}/api/auth.php`,
            users: `${this.baseURL}/api/users.php`,
            tournaments: `${this.baseURL}/api/tournaments.php`,
            fights: `${this.baseURL}/api/fights.php`,
            notifications: `${this.baseURL}/api/notifications.php`,
            upload: `${this.baseURL}/api/upload.php`
        };
    }

    /**
     * Make HTTP request
     */
    async makeRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return { data, error: null };
        } catch (error) {
            console.error('API Request failed:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Authentication methods
     */
    async login(email, password) {
        const url = `${this.endpoints.auth}?action=login`;
        return await this.makeRequest(url, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async signup(userData) {
        const url = `${this.endpoints.auth}?action=signup`;
        return await this.makeRequest(url, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    /**
     * User methods
     */
    async getUsers() {
        return await this.makeRequest(this.endpoints.users);
    }

    async getUser(id) {
        const url = `${this.endpoints.users}?id=${id}`;
        return await this.makeRequest(url);
    }

    async createUser(userData) {
        return await this.makeRequest(this.endpoints.users, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(id, userData) {
        const url = `${this.endpoints.users}?id=${id}`;
        return await this.makeRequest(url, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(id) {
        const url = `${this.endpoints.users}?id=${id}`;
        return await this.makeRequest(url, {
            method: 'DELETE'
        });
    }

    /**
     * Tournament methods
     */
    async getTournaments() {
        return await this.makeRequest(this.endpoints.tournaments);
    }

    async getTournament(id) {
        const url = `${this.endpoints.tournaments}?id=${id}`;
        return await this.makeRequest(url);
    }

    async getTournamentParticipants(id) {
        const url = `${this.endpoints.tournaments}?id=${id}&action=participants`;
        return await this.makeRequest(url);
    }

    async createTournament(tournamentData) {
        return await this.makeRequest(this.endpoints.tournaments, {
            method: 'POST',
            body: JSON.stringify(tournamentData)
        });
    }

    async updateTournament(id, tournamentData) {
        const url = `${this.endpoints.tournaments}?id=${id}`;
        return await this.makeRequest(url, {
            method: 'PUT',
            body: JSON.stringify(tournamentData)
        });
    }

    async deleteTournament(id) {
        const url = `${this.endpoints.tournaments}?id=${id}`;
        return await this.makeRequest(url, {
            method: 'DELETE'
        });
    }

    async participateInTournament(tournamentId, userId) {
        const url = `${this.endpoints.tournaments}?action=participate`;
        return await this.makeRequest(url, {
            method: 'POST',
            body: JSON.stringify({
                tournament_id: tournamentId,
                user_id: userId
            })
        });
    }

    async leaveTournament(tournamentId, userId) {
        const url = `${this.endpoints.tournaments}?action=leave`;
        return await this.makeRequest(url, {
            method: 'DELETE',
            body: JSON.stringify({
                tournament_id: tournamentId,
                user_id: userId
            })
        });
    }

    /**
     * Fight methods
     */
    async getFights() {
        return await this.makeRequest(this.endpoints.fights);
    }

    async getFight(id) {
        const url = `${this.endpoints.fights}?id=${id}`;
        return await this.makeRequest(url);
    }

    async getFightsByTournament(tournamentId) {
        const url = `${this.endpoints.fights}?tournament_id=${tournamentId}`;
        return await this.makeRequest(url);
    }

    async createFight(fightData) {
        return await this.makeRequest(this.endpoints.fights, {
            method: 'POST',
            body: JSON.stringify(fightData)
        });
    }

    async organizeFights(tournamentId) {
        const url = `${this.endpoints.fights}?action=organize`;
        return await this.makeRequest(url, {
            method: 'POST',
            body: JSON.stringify({ tournament_id: tournamentId })
        });
    }

    async updateFight(id, fightData) {
        const url = `${this.endpoints.fights}?id=${id}`;
        return await this.makeRequest(url, {
            method: 'PUT',
            body: JSON.stringify(fightData)
        });
    }

    async deleteFight(id) {
        const url = `${this.endpoints.fights}?id=${id}`;
        return await this.makeRequest(url, {
            method: 'DELETE'
        });
    }

    /**
     * Notification methods
     */
    async getNotifications(userId = null) {
        const url = userId ? 
            `${this.endpoints.notifications}?user_id=${userId}` : 
            this.endpoints.notifications;
        return await this.makeRequest(url);
    }

    async getUnreadCount(userId) {
        const url = `${this.endpoints.notifications}?user_id=${userId}&action=unread-count`;
        return await this.makeRequest(url);
    }

    async createNotification(notificationData) {
        return await this.makeRequest(this.endpoints.notifications, {
            method: 'POST',
            body: JSON.stringify(notificationData)
        });
    }

    async markNotificationAsRead(id) {
        const url = `${this.endpoints.notifications}?id=${id}&action=mark-read`;
        return await this.makeRequest(url, {
            method: 'PUT'
        });
    }

    async markAllNotificationsAsRead(userId) {
        const url = `${this.endpoints.notifications}?action=mark-all-read`;
        return await this.makeRequest(url, {
            method: 'PUT',
            body: JSON.stringify({ user_id: userId })
        });
    }

    async deleteNotification(id) {
        const url = `${this.endpoints.notifications}?id=${id}`;
        return await this.makeRequest(url, {
            method: 'DELETE'
        });
    }

    /**
     * File upload method
     */
    async uploadFile(file, type = 'general') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const response = await fetch(this.endpoints.upload, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            return { data, error: null };
        } catch (error) {
            console.error('File upload failed:', error);
            return { data: null, error: error.message };
        }
    }    /**
     * Utility methods for API compatibility
     */
    from(table) {
        return {
            select: (columns = '*') => ({
                eq: (column, value) => this.queryData(table, columns, { [column]: value }),
                order: (column, options = {}) => this.queryData(table, columns, null, { order: column, ...options }),
                execute: () => this.queryData(table, columns)
            }),
            insert: (data) => ({
                execute: () => this.insertData(table, data)
            }),
            update: (data) => ({
                eq: (column, value) => ({
                    execute: () => this.updateData(table, data, { [column]: value })
                })
            }),
            delete: () => ({
                eq: (column, value) => ({
                    execute: () => this.deleteData(table, { [column]: value })
                })
            })
        };
    }

    async queryData(table, columns, where, options) {
        switch(table) {
            case 'users':
                return await this.getUsers();
            case 'tournaments':
                return await this.getTournaments();
            case 'fights':
                return await this.getFights();
            case 'notifications':
                return await this.getNotifications();
            default:
                return { data: null, error: 'Table not found' };
        }
    }

    async insertData(table, data) {
        switch(table) {
            case 'users':
                return await this.createUser(data);
            case 'tournaments':
                return await this.createTournament(data);
            case 'fights':
                return await this.createFight(data);
            case 'notifications':
                return await this.createNotification(data);
            case 'participants':
                return await this.participateInTournament(data.tournament_id, data.user_id);
            default:
                return { data: null, error: 'Table not found' };
        }
    }
}

// Create global instance
window.gymPowerAPI = new GymPowerAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GymPowerAPI;
}
