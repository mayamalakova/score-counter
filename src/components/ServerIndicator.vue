<template>
    <span class="serve-indicator">{{server === side ? "'" : ""}}</span>
</template>
<script>
    export default {
        name: 'server-indicator',
        props: ["server", "side"]
    }
</script>