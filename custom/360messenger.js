const NotificationProvider = require("./notification-provider");
const axios = require("axios");

class messenger360 extends NotificationProvider {
    name = "messenger360";

    /**
     * @inheritdoc
     */
    async send(notification, msg, monitorJSON = null, heartbeatJSON = null) {
        const okMsg = "Sent Successfully.";

        try {
            let config = {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + notification.messenger360AuthToken,
                }
            };
            config = this.getAxiosConfigWithProxy(config);

            // Use custom template if enabled
            let message = msg;
            if (notification.messenger360UseTemplate && notification.messenger360Template) {
                message = this.applyTemplate(notification.messenger360Template, msg, monitorJSON, heartbeatJSON);
            }

            const hasGroupId = notification.messenger360GroupId && notification.messenger360GroupId.trim() !== "";
            const hasRecipient = notification.messenger360Recipient && notification.messenger360Recipient.trim() !== "";

            // Send to both if both are provided
            if (hasGroupId && hasRecipient) {
                // Send to individual recipient
                let recipientData = {
                    "phonenumber": notification.messenger360Recipient,
                    "text": message,
                };
                await axios.post("https://api.360messenger.com/v2/sendMessage", recipientData, config);

                // Send to group
                let groupData = {
                    "groupId": notification.messenger360GroupId,
                    "text": message,
                };
                await axios.post("https://api.360messenger.com/v2/sendGroup", groupData, config);

                return okMsg + " (Sent to both recipient and group)";
            } 
            // Send to group only
            else if (hasGroupId) {
                let data = {
                    "groupId": notification.messenger360GroupId,
                    "text": message,
                };
                await axios.post("https://api.360messenger.com/v2/sendGroup", data, config);
                return okMsg + " (Sent to group)";
            } 
            // Send to individual recipient only
            else if (hasRecipient) {
                let data = {
                    "phonenumber": notification.messenger360Recipient,
                    "text": message,
                };
                await axios.post("https://api.360messenger.com/v2/sendMessage", data, config);
                return okMsg + " (Sent to recipient)";
            } 
            else {
                throw new Error("No recipient or group specified");
            }

        } catch (error) {
            this.throwGeneralAxiosError(error);
        }
    }

    /**
     * Apply template with variables
     * @param {string} template - Template string
     * @param {string} msg - Default message
     * @param {object} monitorJSON - Monitor data
     * @param {object} heartbeatJSON - Heartbeat data
     * @returns {string} Formatted message
     */
    applyTemplate(template, msg, monitorJSON, heartbeatJSON) {
        try {
            // Simple template replacement
            let result = template;
            
            // Replace monitor variables
            if (monitorJSON) {
                result = result.replace(/{{ monitorJSON\['name'\] }}/g, monitorJSON.name || '');
                result = result.replace(/{{ monitorJSON\['url'\] }}/g, monitorJSON.url || '');
            }
            
            // Replace message variable
            result = result.replace(/{{ msg }}/g, msg);
            
            // Handle conditional blocks (simple if statements)
            result = result.replace(/{% if monitorJSON %}([\s\S]*?){% endif %}/g, (match, content) => {
                return monitorJSON ? content : '';
            });
            
            return result;
        } catch (error) {
            // If template parsing fails, return original message
            return msg;
        }
    }

}

module.exports = messenger360;