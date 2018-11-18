<template>
    <div class="top-toolbar">
        <div class="icon-rotate-ccw" @click="$emit(Events.RESTART)"></div>
        <div class="icon-menu1" @click="$emit(Events.TOGGLE_EDIT)"></div>
    </div>
</template>

<script>
    import Events from '../utils/events';

    export default {
        name: 'actions-bar',
        props: [],
        data: function () {
            return {Events: Events};
        }
    }
</script>
