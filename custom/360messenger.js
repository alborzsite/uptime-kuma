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

            let data = {
                "phonenumber": notification.messenger360Recipient,
                "text": msg,
            };

            let url = "https://api.360messenger.com/v2/sendMessage";

            await axios.post(url, data, config);

            return okMsg;
        } catch (error) {
            this.throwGeneralAxiosError(error);
        }
    }

}

module.exports = messenger360;
