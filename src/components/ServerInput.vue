<script setup lang="ts">
defineProps<{
    checked: boolean
}>()

const emit = defineEmits<{
    select: []
}>()
</script>

<template>
    <label class="label-small_serving">
        Serving
        <input type="radio" class="input-radio" name="server"
               :checked="checked"
               @input="emit('select')"/>
    </label>
</template>
