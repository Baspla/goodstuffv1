<script>
    export let text = 'Lorem ipsum dolor sit amet.';
</script>

<div class="flex flex-row gap-3 ">
    <!--suppress JSUnresolvedReference -->
    <h1 class="text-center text-4xl" title="{PKG.version}">{text}</h1>
    <div class="flex flex-col">
        <div class="grow"></div>
        <h2 class="text-center text-xl sm:visible invisible ">Empfehlungen der Gnag</h2>
    </div>
</div>