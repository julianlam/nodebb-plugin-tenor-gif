<form role="form" class="tenor-gif-settings">
	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">General</div>
		<div class="col-sm-10 col-xs-12">
			<p class="lead">
				Sign up for your Tenor GIF API Key from the <a href="https://console.cloud.google.com/apis/credentials">Google Cloud Console</a>, then enter it below and reload your NodeBB.
			</p>
			<p>
				<strong>Be careful</strong>: If you use the <i class="fa fa-copy"></i> button to copy the API key, it'll add spaces to the beginning and end. You'll need to remove those.
			</p>
			<div class="form-group">
				<label for="key">API Key</label>
				<input type="text" id="key" name="key" title="API Key" class="form-control" placeholder="API Key">
			</div>
			<div class="form-group">
				<label for="contentFilter">Content Filter</label>
				<select class="form-control" id="contentFilter" name="contentFilter">
					<option value="off">Off</option>
					<option value="low">Low</option>
					<option value="medium" selected>Medium (default)</option>
					<option value="high">High</option>
				</select>
			</div>
			<div class="form-group">
				<label for="limit">Limit results</label>
				<input class="form-control" type="number" min="1" max="50" id="limit" placeholder="10" name="limit" />
			</div>
		</div>
	</div>
</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>