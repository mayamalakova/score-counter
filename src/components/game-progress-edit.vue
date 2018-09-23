<template>
    <div class="score-container" >
        <div class="score-left">
            <div class="score-val">
                <span :class="valClass">{{scoreLeft}} </span>
                <input type="radio" 
                    name="server" value="left"
                    class="server-option"
                    v-model="$parent.newServer"
                    />
            </div>
            <div class="btn-minus">-</div>
        </div>
        <div class="score-right">
            <div class="score-val">
                <span :class="valClass">{{scoreRight}}</span>
                <input type="radio" 
                    name="server" value="right" 
                    class="server-option"
                    v-model="$parent.newServer"
                    />
            </div>
            <div class="btn-minus">-</div>
        </div>
    </div>
</template>
<script>
export default {
    props: ['scoreLeft', 'scoreRight', 'newServer'],
    computed: {
        valClass: function() {
            let valueSize = (this.scoreLeft > 9 || this.scoreRight > 9) ? "small" : "normal";
            return "score-val-number " + valueSize;
        }
    }
};

</script>
