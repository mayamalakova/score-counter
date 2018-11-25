<template>
    <label class="label-small_serving">
        Serving
        <input type="radio" class="input-radio" name="server"
               :checked="checked"
               @input="$emit('update')"/>
    </label>
</template>
<script>
    export default {
        name: 'server-input',
        props: ["checked"]
    }
</script>
