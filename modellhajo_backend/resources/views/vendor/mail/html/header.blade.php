@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<span style="display:inline-flex;align-items:center;gap:12px;">
	<span style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:#4483d4;color:#fff;font-size:18px;font-weight:700;">M</span>
	<span style="font-size:20px;color:#224c8f;">{!! $slot !!}</span>
</span>
</a>
</td>
</tr>
