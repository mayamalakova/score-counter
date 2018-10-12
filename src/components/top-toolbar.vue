<template>
    <div class="top-toolbar">
        <div @click="restart" class="icon-rotate-ccw"> </div>
        <div @click="toggleEdit" class="icon-menu1"> </div>
    </div>
</template>

<script>
export default {
    props: ["toggleEdit", "restart", "editMode"]
}
</script>
