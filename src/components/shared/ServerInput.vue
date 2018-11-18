<template>
    <label class="label-small for-inlined-input">
        Serving
        <input type="radio" class="input-radio" name="server"
               :checked="checked"
               @input="$emit('update', server)"/>
    </label>
</template>
<script>
    export default {
        name: 'server-input',
        props: ["server", "checked"]
    }
</script>
