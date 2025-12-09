<template>
    <div class="mb-3">
        <label for="360messenger-auth-token" class="form-label">{{ $t("Token") }}</label>
        <HiddenInput 
            id="360messenger-auth-token" 
            v-model="$parent.notification.messenger360AuthToken" 
            :required="true" 
            autocomplete="new-password"
        ></HiddenInput>
        <i18n-t tag="div" keypath="wayToGet360messengerUrlAndToken" class="form-text">
            <a href="https://app.360messenger.com/" target="_blank">https://app.360messenger.com/</a>
        </i18n-t>
    </div>

    <div class="mb-3">
        <label for="360messenger-recipient" class="form-label">{{ $t("360messengerRecipient") }}</label>
        <input 
            id="360messenger-recipient" 
            v-model="$parent.notification.messenger360Recipient" 
            type="text" 
            pattern="^[\d-]{10,31}(@[\w\.]{1,})?$" 
            class="form-control" 
            required
        >
        <div class="form-text">{{ $t("wayToWrite360messengerRecipient", ["00117612345678", "00117612345678@s.whatsapp.net", "123456789012345678@g.us"]) }}</div>
    </div>

    <i18n-t tag="div" keypath="More info on:" class="mb-3 form-text">
        <a href="https://360messenger.com/" target="_blank">https://360messenger.com/</a>
    </i18n-t>
</template>

<script>
import HiddenInput from "../HiddenInput.vue";

export default {
    components: {
        HiddenInput,
    }
};
</script>