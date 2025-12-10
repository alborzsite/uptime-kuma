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

            const hasGroupId = notification.messenger360GroupId && notification.messenger360GroupId.trim() !== "";
            const hasRecipient = notification.messenger360Recipient && notification.messenger360Recipient.trim() !== "";

            // Send to both if both are provided
            if (hasGroupId && hasRecipient) {
                // Send to individual recipient
                let recipientData = {
                    "phonenumber": notification.messenger360Recipient,
                    "text": msg,
                };
                await axios.post("https://api.360messenger.com/v2/sendMessage", recipientData, config);

                // Send to group
                let groupData = {
                    "groupId": notification.messenger360GroupId,
                    "text": msg,
                };
                await axios.post("https://api.360messenger.com/v2/sendGroup", groupData, config);

                return okMsg + " (Sent to both recipient and group)";
            } 
            // Send to group only
            else if (hasGroupId) {
                let data = {
                    "groupId": notification.messenger360GroupId,
                    "text": msg,
                };
                await axios.post("https://api.360messenger.com/v2/sendGroup", data, config);
                return okMsg + " (Sent to group)";
            } 
            // Send to individual recipient only
            else if (hasRecipient) {
                let data = {
                    "phonenumber": notification.messenger360Recipient,
                    "text": msg,
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

}

module.exports = messenger360;