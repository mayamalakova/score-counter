<template>
    <div class="edit-button">
        <div @click="toggleEdit">...</div>
    </div>
</template>

<script>
export default {
    props: ["toggleEdit", "editMode"]
}
</script>
