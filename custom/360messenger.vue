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
            placeholder="447488888888"
            :required="!$parent.notification.messenger360GroupId"
        >
        <div class="form-text">{{ $t("wayToWrite360messengerRecipient", ["00117612345678", "00117612345678@s.whatsapp.net", "123456789012345678@g.us"]) }}</div>
    </div>

    <!-- Checkbox to enable/disable Combobox -->
    <div class="mb-3 form-check form-switch">
        <input 
            id="360messenger-enable-options" 
            v-model="isOptionsEnabled" 
            type="checkbox" 
            class="form-check-input"
        >
        <label for="360messenger-enable-options" class="form-check-label">
            Enable Group Chat
        </label>
    </div>

    <!-- Combobox that is enabled/disabled based on Checkbox -->
    <div class="mb-3">
        <label for="360messenger-group-list" class="form-label">Group Chat</label>
        <select 
            id="360messenger-group-list" 
            v-model="$parent.notification.messenger360GroupId" 
            class="form-select"
            :disabled="!isOptionsEnabled || isLoadingGroups"
        >
            <option value="">{{ isLoadingGroups ? 'Loading...' : 'Select a group...' }}</option>
            <option 
                v-for="group in groups" 
                :key="group.id" 
                :value="group.id"
            >
                {{ group.id }} - {{ group.name }}
            </option>
        </select>
        <div class="form-text">Select a group to send message</div>
        <div v-if="errorMessage" class="text-danger mt-1">{{ errorMessage }}</div>
        <div v-if="$parent.notification.messenger360GroupId" class="alert alert-info mt-2 mb-0">
            <strong>Selected Group ID:</strong> {{ $parent.notification.messenger360GroupId }}
        </div>
    </div>

    <i18n-t tag="div" keypath="More info on:" class="mb-3 form-text">
        <a href="https://360messenger.com/" target="_blank">https://360messenger.com/</a>
    </i18n-t>

    <div class="mb-3">
        <div class="form-check form-switch">
            <input v-model="$parent.notification.messenger360UseTemplate" class="form-check-input" type="checkbox">
            <label class="form-check-label">{{ $t("Use Custom Message Template") }}</label>
        </div>

        <div class="form-text">
            {{ $t("Enable custom message formatting with variables") }}
        </div>
    </div>

    <template v-if="$parent.notification.messenger360UseTemplate">
        <div class="mb-3">
            <label class="form-label" for="360messenger-template">{{ $t('Message Template') }}</label>
            <TemplatedTextarea 
                id="360messenger-template" 
                v-model="$parent.notification.messenger360Template" 
                :required="true" 
                :placeholder="messenger360TemplatedTextareaPlaceholder"
            ></TemplatedTextarea>
        </div>
    </template>
</template>

<script>
import HiddenInput from "../HiddenInput.vue";
import TemplatedTextarea from "../TemplatedTextarea.vue";

export default {
    components: {
        HiddenInput,
        TemplatedTextarea,
    },
    data() {
        return {
            isOptionsEnabled: false,
            groups: [],
            isLoadingGroups: false,
            errorMessage: ""
        };
    },
    computed: {
        messenger360TemplatedTextareaPlaceholder() {
            return this.$t("Example:", [
                `
360Messenger Alert{% if monitorJSON %} - {{ monitorJSON['name'] }}{% endif %}

{{ msg }}
                `,
            ]);
        }
    },
    watch: {
        // When checkbox is enabled, fetch groups from API
        isOptionsEnabled(newValue, oldValue) {
            if (newValue) {
                this.fetchGroups();
            } else if (oldValue && !this.errorMessage) {
                // Only clear if user manually unchecked (not due to error)
                this.$parent.notification.messenger360GroupId = "";
                this.groups = [];
            }
        }
    },
    methods: {
        async fetchGroups() {
            this.isLoadingGroups = true;
            this.errorMessage = "";
            
            try {
                const token = this.$parent.notification.messenger360AuthToken;
                
                if (!token) {
                    this.errorMessage = "Please enter your API token first";
                    this.isLoadingGroups = false;
                    this.isOptionsEnabled = false;
                    return;
                }

                const response = await fetch('https://api.360messenger.com/v2/groupChat/getGroupList', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success && result.data && result.data.groups) {
                    this.groups = result.data.groups;
                    if (this.groups.length === 0) {
                        this.errorMessage = "No groups found";
                        this.isOptionsEnabled = false;
                    }
                } else {
                    // Handle API error response
                    const statusCode = result.statusCode || response.status;
                    const message = result.message || "Failed to load groups";
                    this.errorMessage = `Error ${statusCode}: ${message}`;
                    this.isOptionsEnabled = false;
                }
            } catch (error) {
                this.errorMessage = `Error: ${error.message}`;
                this.isOptionsEnabled = false;
                console.error('Error fetching groups:', error);
            } finally {
                this.isLoadingGroups = false;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
textarea {
    min-height: 150px;
}
</style>