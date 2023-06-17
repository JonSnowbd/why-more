<script>
    // Importing anything just works
    import Header from "./lib/Header.svelte";
    console.log("Script works.")
</script>

<style>
    /* And css works fine. */
    h3{
        color:red;
    }
</style>

<Header name="Second Example" />
<h3>The other example file.</h3>